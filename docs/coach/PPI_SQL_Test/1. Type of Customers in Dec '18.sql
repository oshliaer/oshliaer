SELECT 
  'Lost Costumer' AS customer_type, 
  COUNT(DISTINCT id_user) AS number_of_costumers 
FROM 
  Transactions 
WHERE 
  trx_date >= 20181101 
  AND trx_date < 20181201 
  AND id_user NOT IN (
    SELECT 
      id_user 
    FROM 
      Transactions 
    WHERE 
      trx_date >= 20181201
  ) 
UNION 
SELECT 
  'Loyal Costumer' AS customer_type, 
  COUNT(DISTINCT id_user) AS number_of_costumers 
FROM 
  Transactions 
WHERE 
  trx_date >= 20181101 
  AND trx_date < 20181201 
  AND id_user IN (
    SELECT 
      id_user 
    FROM 
      Transactions 
    WHERE 
      trx_date >= 20181201
	  AND trx_date < 20190101
  ) 
UNION 
SELECT 
  'New Costumer' AS customer_type, 
  COUNT(DISTINCT id_user) AS number_of_costumers 
FROM 
  Transactions 
WHERE 
  trx_date >= 20181201 
  AND trx_date < 20191201 
  AND id_user NOT IN (
    SELECT 
      id_user 
    FROM 
      Transactions 
    WHERE 
      trx_date >= 20181101 
      AND trx_date < 20181201
  )
