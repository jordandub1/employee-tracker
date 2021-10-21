-- DEPARTMENT SEEDS -----
INSERT INTO department (name)
VALUE ("Sales");
INSERT INTO department (name)
VALUE ("Engineering");
INSERT INTO department (name)
VALUE ("Finance");
INSERT INTO department (name)
VALUE ("Legal");

--Role
INSERT INTO role (title, salary, department_id)
VALUE ("Lead Engineer", 150000, 2);
INSERT INTO role (title, salary, department_id)
VALUE ("Legal Team Lead", 250000, 4);
INSERT INTO role (title, salary, department_id)
VALUE ("Accountant", 125000, 3);
INSERT INTO role (title, salary, department_id)
VALUE ("Sales Lead", 100000, 1);
INSERT INTO role (title, salary, department_id)
VALUE ("Salesperson", 80000, 1);
INSERT INTO role (title, salary, department_id)
VALUE ("Software Engineer", 120000, 2);
INSERT INTO role (title, salary, department_id)
VALUE ("Lawyer", 190000, 4);

--Employee
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUE ("Jessica", "Haze", 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUE ("Tiffany", "Patric", 2, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUE ("Mia", "Lam", 3, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUE ("Bently", "Lao", 4, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUE ("Chris", "Melby", 5, 4);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUE ("Jason", "Baker", 6, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUE ("Tom", "Nice", 7, 2);