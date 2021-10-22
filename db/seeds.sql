USE employee_trackerDB;

INSERT INTO department (name)
VALUES ("Sales");
INSERT INTO department (name)
VALUES ("Engineering");
INSERT INTO department (name)
VALUES ("Finance");
INSERT INTO department (name)
VALUES ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1);
INSERT INTO role (title, salary, department_id)
VALUES ("Lead Engineer", 150000, 2);
INSERT INTO role (title, salary, department_id)
VALUES ("Software Engineer", 120000, 2);
INSERT INTO role (title, salary, department_id)
VALUES ("Accountant", 125000, 3);
INSERT INTO role (title, salary, department_id)
VALUES ("Legal Team Lead", 250000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jane", "Doe", 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Malia", "Chan", 2, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Robert", "Rodriguez", 3, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Laney", "Smith", 4, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Joe", "Brown", 5, 2);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Phillip", "Lourd", 2, 7);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Rosalie", "Allen", 5, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Christina", "Eckenrode", 1, 7);