CREATE TABLE shop_stock_holds (
 reference TEXT NOT NULL REFERENCES zetupay_attempts(reference),
 product_id TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity > 0),
 PRIMARY KEY(reference, product_id)
);
CREATE INDEX shop_stock_holds_product ON shop_stock_holds(product_id);

CREATE TRIGGER shop_reserve_stock AFTER INSERT ON zetupay_attempts
WHEN EXISTS (SELECT 1 FROM commerce WHERE id=NEW.quote_id AND kind='order' AND json_extract(data,'$.directCheckout')=1)
BEGIN
 SELECT CASE WHEN EXISTS (
  SELECT 1 FROM commerce c, json_each(c.data,'$.calculation.lines') line
  LEFT JOIN products p ON p.id=json_extract(line.value,'$.id')
  WHERE c.id=NEW.quote_id AND (
   p.id IS NULL OR COALESCE(json_extract(p.data,'$.published'),0)<>1
   OR COALESCE(json_extract(p.data,'$.featured'),0)<>1
   OR json_extract(p.data,'$.price') IS NOT json_extract(line.value,'$.unitPrice')
   OR COALESCE(json_extract(p.data,'$.stockQuantity'),0) < json_extract(line.value,'$.quantity') + COALESCE((
    SELECT SUM(h.quantity) FROM shop_stock_holds h JOIN zetupay_attempts a ON a.reference=h.reference
    WHERE h.product_id=p.id AND a.state='pending'
   ),0)
  )
 ) THEN RAISE(ABORT,'Shop stock or price changed. Return to the cart and try again.') END;
 INSERT INTO shop_stock_holds(reference,product_id,quantity)
 SELECT NEW.reference,json_extract(line.value,'$.id'),json_extract(line.value,'$.quantity')
 FROM commerce c,json_each(c.data,'$.calculation.lines') line WHERE c.id=NEW.quote_id;
END;

CREATE TRIGGER shop_consume_stock AFTER UPDATE OF state ON zetupay_attempts
WHEN OLD.state='pending' AND NEW.state='paid'
BEGIN
 UPDATE products SET data=json_set(data,'$.stockQuantity',json_extract(data,'$.stockQuantity')-(
  SELECT quantity FROM shop_stock_holds WHERE reference=NEW.reference AND product_id=products.id
 )) WHERE id IN (SELECT product_id FROM shop_stock_holds WHERE reference=NEW.reference);
END;

CREATE TRIGGER shop_keep_reserved_stock BEFORE UPDATE ON products
WHEN COALESCE(json_extract(NEW.data,'$.stockQuantity'),0)<COALESCE((
 SELECT SUM(h.quantity) FROM shop_stock_holds h JOIN zetupay_attempts a ON a.reference=h.reference
 WHERE h.product_id=OLD.id AND a.state='pending'
),0)
BEGIN
 SELECT RAISE(ABORT,'Stock cannot be reduced below quantities reserved for pending payments.');
END;

CREATE TRIGGER shop_keep_reserved_product BEFORE DELETE ON products
WHEN EXISTS (
 SELECT 1 FROM shop_stock_holds h JOIN zetupay_attempts a ON a.reference=h.reference
 WHERE h.product_id=OLD.id AND a.state='pending'
)
BEGIN
 SELECT RAISE(ABORT,'This product has pending payments.');
END;
