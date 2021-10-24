const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");
require('dotenv').config();

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  firstPrompt();
});

// function which prompts the user for what action they should take
function firstPrompt() {
  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "Would you like to do?",
      choices: [
        "View All Employees",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department",
        "End",
      ],
    })
    .then(function ({ task }) {
      switch (task) {
        case "View All Employees":
          viewEmployees();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "Add Role":
          addRole();
          break;
        case "View All Departments":
          viewAllDepartments();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "End":
          connection.end();
          break;
      }
    });
}

//View Employees Function

function viewEmployees() {
  console.log("Viewing employees\n");

  var query =
    "SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;";

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Employees viewed!\n");

    firstPrompt();
  });
}

// Adding Employee Function
var roleArr = [];
function selectRole() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      roleArr.push(res[i].title);
    }
  });
  return roleArr;
}

var managersArr = [];
function selectManager() {
  connection.query(
    "SELECT first_name, last_name FROM employee WHERE manager_id IS NULL",
    function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
        managersArr.push(res[i].first_name);
      }
    }
  );
  return managersArr;
}

function addEmployee() {
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "Enter their first name ",
      },
      {
        name: "lastName",
        type: "input",
        message: "Enter their last name ",
      },
      {
        name: "role",
        type: "list",
        message: "What is their role? ",
        choices: selectRole(),
      },
      {
        name: "choice",
        type: "rawlist",
        message: "Whats their managers name?",
        choices: selectManager(),
      },
    ])
    .then(function (val) {
      var roleId = selectRole().indexOf(val.role) + 1;
      var managerId = selectManager().indexOf(val.choice) + 1;
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: val.firstName,
          last_name: val.lastName,
          manager_id: managerId,
          role_id: roleId,
        },
        function (err) {
          if (err) throw err;
          console.table(val);
          console.log("Employee has been added!\n");
          firstPrompt();
        }
      );
    });
}

//Update Employee Role Function
function updateEmployeeRole() {
  employeeArray();
}

function employeeArray() {
  console.log("Updating an employee");

  var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON d.id = r.department_id JOIN employee m ON m.id = e.manager_id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("employeeArray To Update!\n");

    roleArray(employeeChoices);
  });
}

function roleArray(employeeChoices) {
  console.log("Updating an role");

  var query = `SELECT r.id, r.title, r.salary FROM role r`;
  let roleChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleChoices = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));

    console.table(res);
    console.log("roleArray to Update!\n");

    promptEmployeeRole(employeeChoices, roleChoices);
  });
}

function promptEmployeeRole(employeeChoices, roleChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with the role?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to update?",
        choices: roleChoices,
      },
    ])
    .then(function (answer) {
      var query = `UPDATE employee SET role_id = ? WHERE id = ?`;
      connection.query(
        query,
        [answer.roleId, answer.employeeId],
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.affectedRows + " row has updated successfully!\n");

          firstPrompt();
        }
      );
    });
}

//View All Roles Function
function viewAllRoles() {
  connection.query(
    "SELECT * FROM employee_trackerDB.role;",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      console.log("Displaying all roles!\n");
      firstPrompt();
    }
  );
}

//Add Role Function
function addRole() {
  var query =
    "SELECT role.title AS Title, role.salary AS Salary, role.department_id AS DepartmentID, department.name AS DepartmentName FROM department INNER JOIN role ON department.id = role.department_id";

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Department array!");

    promptAddRole();
  });
}

function promptAddRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "Title",
        message: "Role title?",
      },
      {
        type: "input",
        name: "Salary",
        message: "Role Salary",
      },
      {
        type: "list",
        name: "DepartmentID",
        message:
          "Department (use table above to match ID with Department Name)?",
        choices: [1, 2, 3, 4],
      },
    ])
    .then(function (answer) {
      var query = `INSERT INTO role SET ?`;

      connection.query(
        query,
        {
          title: answer.Title,
          salary: answer.Salary,
          department_id: answer.DepartmentID,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Role Inserted!\n");

          firstPrompt();
        }
      );
    });
}

//View All Departments Function
function viewAllDepartments() {
  connection.query(
    "SELECT * FROM employee_trackerDB.department;",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      console.log("Displaying all departments!\n");
      firstPrompt();
    }
  );
}

//Add Department Function
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What Department would you like to add?",
      },
    ])
    .then(function (res) {
      var query = connection.query(
        "INSERT INTO department SET ? ",
        {
          name: res.name,
        },
        function (err) {
          if (err) throw err;
          console.table(res);
          console.log("Department added!\n");
          firstPrompt();
        }
      );
    });
}
