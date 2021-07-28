SELECT 'a) < 10K USD' AS revenue_bucket, COUNT(*) AS number_of_companies FROM Company_Annual_Revenue WHERE revenue<10000
UNION
SELECT 'b) 10K USD to 50K USD' AS revenue_bucket, COUNT(*) AS number_of_companies FROM Company_Annual_Revenue WHERE revenue>=10000 AND revenue<50000
UNION
SELECT 'c) 50K USD to 100K USD' AS revenue_bucket, COUNT(*) AS number_of_companies FROM Company_Annual_Revenue WHERE revenue>=50000 AND revenue<100000
UNION
SELECT 'd) 100K USD to 1M USD' AS revenue_bucket, COUNT(*) AS number_of_companies FROM Company_Annual_Revenue WHERE revenue>=100000 AND revenue<1000000
UNION
SELECT 'e) 1M USD to 100M USD' AS revenue_bucket, COUNT(*) AS number_of_companies FROM Company_Annual_Revenue WHERE revenue>=1000000 AND revenue<100000000
UNION
SELECT 'f) > 100M USD' AS revenue_bucket, COUNT(*) AS number_of_companies FROM Company_Annual_Revenue WHERE revenue>100000000