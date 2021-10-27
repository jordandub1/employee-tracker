const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");
require("dotenv").config();

//Connecting to database
var connection = mysql.createConnection(
  {
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  console.log("Connected to the employee_trackerDB database.\n")
);

//Run the start function after the connection is made to prompt the user
connection.connect(function (err) {
  if (err) throw err;
  firstPrompt();
});

//Function to prompt the user for an action to view/manipulate the database
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

//------------------------------ View All Employees Function ------------------------------
function viewEmployees() {
  console.log("Viewing all employees\n");

  //Query to display a table with employee id, first and last name, title, department, salary, and manager
  var query =
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;";

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Employees viewed!\n");

    firstPrompt();
  });
}

//------------------------------ Add an employee section ------------------------------
//Creating role array
var roleArr = [];
function selectRole() {
  //Query to display role table
  var query = "SELECT * FROM role";

  connection.query(query, function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      roleArr.push(res[i].title);
    }
  });
  return roleArr;
}

//Creating managers array
var managersArr = [];
function selectManager() {
  //Query to display managers
  var query = "SELECT * FROM employee WHERE manager_id IS NULL";

  connection.query(query, function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      managersArr.push(res[i].first_name);
    }
  });
  return managersArr;
}

//------------------------------ Function to add an employee ------------------------------
function addEmployee() {
  //Prompts to collect data for employee
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
        name: "manager",
        type: "list",
        message: "Whats their managers name?",
        choices: selectManager(),
      },
    ])
    //Inserting data from answers into the database
    .then(function (val) {
      var roleId = selectRole().indexOf(val.role) + 1;
      var managerId = selectManager().indexOf(val.manager) + 1;

      query = "INSERT INTO employee SET ?";

      connection.query(
        query,
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

//------------------------------ Update Employee Role Function ------------------------------
function updateEmployeeRole() {
  connection.query(
    "SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;",
    function (err, res) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "lastName",
            type: "rawlist",
            message: "What is the employee's last name? ",
            choices: function () {
              var lastName = [];
              for (var i = 0; i < res.length; i++) {
                lastName.push(res[i].last_name);
              }
              return lastName;
            },
          },
          {
            name: "role",
            type: "rawlist",
            message: "What is the employee's new title? ",
            choices: selectRole(),
          },
        ])
        .then(function (val) {
          var roleId = selectRole().indexOf(val.role) + 1;
          connection.query(
            "UPDATE employee SET role_id = ? WHERE last_name = ?",
            [roleId, val.lastName],
            function (err) {
              if (err) throw err;
              console.table(val);
              firstPrompt();
            }
          );
          console.log(roleId);
        });
    }
  );
}

//------------------------------ View All Roles Function ------------------------------
function viewAllRoles() {
  query =
    "SELECT role.title AS job_title, role.id AS role_id, role.salary AS salary, department.name as department_name FROM department INNER JOIN role ON department.id = role.department_id";

  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    console.log("Displaying all roles!\n");
    firstPrompt();
  });
}

//------------------------------ Add Role Function ------------------------------
function addRole() {
  var query =
    "SELECT role.title AS Role, role.salary AS Salary, department.name AS Department FROM department INNER JOIN role on department.id = role.department_id;";

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);

    promptAddRole();
  });
}

var departmentArr = [];
function selectDepartment() {
  //Query to display role table
  var query = "SELECT name FROM department;";

  connection.query(query, function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      departmentArr.push(res[i].name);
    }
  });
  return departmentArr;
}

function promptAddRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Role title?",
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Role Salary",
      },
      {
        type: "rawlist",
        name: "departmentName",
        message: "Department?",
        choices: selectDepartment(),
      },
    ])
    .then(function (answer) {
      var departmentID = selectDepartment().indexOf(answer.departmentName);

      var query = `INSERT INTO role SET ?`;

      connection.query(
        query,
        {
          title: answer.roleTitle,
          salary: answer.roleSalary,
          department_id: departmentID,
        },
        function (err, res) {
          if (err) throw err;

          console.log("Role Inserted!\n");

          firstPrompt();
        }
      );
    });
}

//------------------------------ View All Departments Function ------------------------------
function viewAllDepartments() {
  query =
    "SELECT department.id AS ID, department.name AS Name FROM department;";

  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    console.log("Displaying all departments!\n");
    firstPrompt();
  });
}

//------------------------------ Add Department Function ------------------------------
function addDepartment() {
  //Prompting for department information to add
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What Department would you like to add?",
      },
    ])

    //Inserting data gathered into department table
    .then(function (res) {
      query = "INSERT INTO department SET ?";

      var query = connection.query(query, { name: res.name }, function (err) {
        if (err) throw err;
        console.table(res);
        console.log("Department added!\n");
        firstPrompt();
      });
    });
}