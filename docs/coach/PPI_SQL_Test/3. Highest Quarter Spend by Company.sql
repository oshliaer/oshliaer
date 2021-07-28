SELECT Companies.description,
SUM(spend) FILTER (WHERE Trans.trx_date>=20180101 AND Trans.trx_date<20180401) AS q1_spend,
SUM(spend) FILTER (WHERE Trans.trx_date>=20180401 AND Trans.trx_date<20180701) AS q2_spend,
SUM(spend) FILTER (WHERE Trans.trx_date>=20180701 AND Trans.trx_date<20181001) AS q3_spend,
SUM(spend) FILTER (WHERE Trans.trx_date>=20181001 AND Trans.trx_date<2019101) AS q4_spend
FROM (SELECT * FROM Transactions LEFT JOIN Users ON Transactions.id_user=Users.id) AS Trans LEFT JOIN Companies ON Trans.id_company = Companies.id GROUP BY Companies.description