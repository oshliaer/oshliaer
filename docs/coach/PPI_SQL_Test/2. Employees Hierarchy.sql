SELECT E.employee_name AS employee,
  M.employee_name AS manager
FROM Employees AS E
  LEFT JOIN Employees AS M ON E.id_manager = M.id