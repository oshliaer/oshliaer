SELECT Company_Annual_Revenue.id_company, company_name, spend_2018, Company_Annual_Revenue.revenue, (spend_2018/Company_Annual_Revenue.revenue*100) AS share_spend_ar
  FROM (SELECT SUM(spend) AS spend_2018, *, Companies.description AS company_name
    FROM (SELECT * FROM Transactions LEFT JOIN Users ON Transactions.id_user=Users.id  WHERE Transactions.trx_date>=20180101 AND Transactions.trx_date<20190101) AS Trans LEFT JOIN Companies ON Trans.id_company = Companies.id GROUP BY Companies.description)
AS Data LEFT JOIN Company_Annual_Revenue ON Data.id_company=Company_Annual_Revenue.id_company
ORDER BY Company_Annual_Revenue.id_company