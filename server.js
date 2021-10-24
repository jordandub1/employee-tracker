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

//View All Employees Function
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

//Add an employee section
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
  var query =
    "SELECT first_name, last_name FROM employee WHERE manager_id IS NULL";

  connection.query(query, function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      managersArr.push(res[i].first_name);
    }
  });
  return managersArr;
}

//Function to add an employee
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
        type: "rawlist",
        message: "Whats their managers name?",
        choices: selectManager(),
      },
    ])
    //Inserting data from answers into the database
    .then(function (val) {
      var roleId = selectRole().indexOf(val.role) + 1;

      //TODO: manager not populating on list for new employee
      var managerId = selectManager().indexOf(val.choice) + 1;

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

//Update Employee Role Function
function updateEmployeeRole() {
  employeeArray();
}

//Displaying employee array
function employeeArray() {
  var query =
    "SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON d.id = r.department_id JOIN employee m ON m.id = e.manager_id";

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("employeeArray to update!\n");

    roleArray(employeeChoices);
  });
}

//Displaying role array
function roleArray(employeeChoices) {
  var query = "SELECT r.id, r.title, r.salary FROM role r";
  let roleChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleChoices = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));

    console.table(res);
    console.log("roleArray to update!\n");

    promptEmployeeRole(employeeChoices, roleChoices);
  });
}

//Prompts for which employee to update and what the new role is
function promptEmployeeRole(employeeChoices, roleChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to update the role for?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's new role?",
        choices: roleChoices,
      },
    ])
    //Updating the employee role in the table
    .then(function (answer) {
      var query = "UPDATE employee SET role_id = ? WHERE id = ?;";
      connection.query(
        query,
        [answer.roleId, answer.employeeId],
        function (err, res) {
          if (err) throw err;
        }
      );

      //Querying to display all employees with updated info
      var query =
        "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;";

      connection.query(
        query,
        [answer.roleId, answer.employeeId],
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Employee's role has been updated!\n");

          firstPrompt();
        }
      );
    });
}

//View All Roles Function
function viewAllRoles() {
  query = "SELECT role.title AS job_title, role.id AS role_id, role.salary AS salary, department.name as department_name FROM department INNER JOIN role ON department.id = role.department_id";

  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    console.log("Displaying all roles!\n");
    firstPrompt();
  });
}

//Add Role Function
function addRole() {

  //TODO: Fix query, getting error about r.salary
  var query =
    "SELECT d.id, d.name, r.salary AS budget FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON d.id = r.department_id GROUP BY d.id, d.name"

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));

    console.table(res);
    console.log("Department array!");

    promptAddRole(departmentChoices);
  });
}

function promptAddRole(departmentChoices) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Role title?"
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Role Salary"
      },
      {
        type: "list",
        name: "departmentId",
        message: "Department?",
        choices: departmentChoices
      },
    ])
    .then(function (answer) {

      var query = `INSERT INTO role SET ?`

      connection.query(query, {
        title: answer.title,
        salary: answer.salary,
        department_id: answer.departmentId
      },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Role Inserted!");

          firstPrompt();
        });

    });
}

//Add Department Function
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
