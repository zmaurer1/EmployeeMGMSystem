require ("console.table")
const inquirer = require ("inquirer")
const connection = require ("./db/connection")
const express = require ("express")
const appStart = () => {
    inquirer.prompt([
        {
        type: "list",
        name: "init",
        message: "What would you like to do?",
        choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update An Employee Role', 'Remove An Employee']
        }]).then((data) => {
            if (data.init==="View All Departments"){
                return viewalldepartments()
            }else if (data.init==="View All Roles"){
                return viewallroles()
            }else if (data.init==="Update An Employee Role"){
                return updateemployeerole()
            }else if (data.init==="View All Employees"){
                return viewallemployees()
        
            }else if (data.init === "Add A Role"){
                return addRole()
            }
            else if (data.init === "Add An Employee"){
                return addEmployee()
            }else if (data.init === "Add A Department"){
                return addDepartment()
            }
        })
}
const viewalldepartments = () => {
    const sql = `SELECT department.id, department.name FROM department`;
    connection.promise().query(sql).then(([rows]) => {
        console.table(rows)

    }).then(() => appStart())
    
}
const viewallemployees = () => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name)AS manager FROM employee LEFT JOIN role on employee.role_id=role.id LEFT JOIN department on role.department_id=department.id LEFT JOIN employee manager on manager.id=employee.manager_id;`
    connection.promise().query(sql).then(([rows]) => {
        console.table(rows)
    }).then(() => 
    appStart())
    
}
const updateemployeerole = () => {
    const sql = `SELECT role.id, role.title FROM role`;
    const sql2 = `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name)as employee FROM employee`
    connection.promise().query(sql).then(([rows]) => {
        const roleARR=rows.map(row => ({
            name:row.title, value:row.id
        }))
        connection.promise().query(sql2).then(([rows]) => {
            const employeeARR = rows.map(row => ({
                name:row.employee, value:row.id
            }))
            inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Pick an Employee",
                    choices: employeeARR
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "Pick a role",
                    choices: roleARR
                }
            ]).then(result => {
                connection.promise().query(`UPDATE employee SET role_id = ? WHERE id = ?`, [result.role_id, result.id])
            }).then(() => viewallemployees()).catch(err => {
                console.log(err)
            })
        })
    })
}
const viewallroles = () => {
    const sql = `SELECT * FROM role`
    connection.promise().query(sql).then(([rows]) => {
        console.table(rows)
    }).then(() => appStart())
}
const addRole = () => {
    const sql = `SELECT department.id, department.name FROM department`
    connection.promise().query(sql).then (([rows]) => {
        const departmentARR = rows.map(row => ({
            name:row.name, value:row.id
        }))
        inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Enter the Role Title",

            },
            {
                type: "input",
                name: "salary",
                message: "Enter the Role salary",
                
            },
            {
                type: "list",
                name: "department_id",
                message: "Pick a Department",
                choices: departmentARR,
                
            }
        ]).then(result => {
            connection.promise().query(`INSERT INTO role SET ?`, result)
        }).then(() => viewallroles()).catch(err => {
            console.log(err)
        })
    })
}
const addEmployee = () => {
    const sql = `SELECT role.id, role.title FROM role`
    const sql2 = `SELECT employee.id, employee.first_name, employee.last_name FROM employee`
    connection.promise().query(sql).then (([rows]) => {
        const roleARR = rows.map(row => ({
            name:row.name, value:row.id
        }))
        connection.promise().query(sql2).then (([rows]) => {
            const managerARR = rows.map(row => ({
                name:row.first_name + " " + row.last_name, value: row.id
            }))
        })
        inquirer.prompt([
            {
                type: "input",
                name: "first_name",
                message: "Enter the first name",

            },
            {
                type: "input",
                name: "last_name",
                message: "Enter the last name",
                
            },
            {
                type: "list",
                name: "role_id",
                message: "Pick a Role",
                choices: rollARR,
                
            },
            {
                type: "list",
                name: "manager_id",
                message: "Pick the Manager",
                choices: [...managerARR,{
                    name:"none", value:null
                }]
            }
        ]).then(result => {
            connection.promise().query(`INSERT INTO employee SET ?`, result)
        }).then(() => viewallemployees()).catch(err => {
            console.log(err)
        })
    })
}
const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "departmentname",
            message: "Enter the Department Name",
        }
    ]).then(data => {
        connection.promise().query(`INSERT INTO department SET name = ?`, data.departmentname)
    }).then(([rows]) => {
        console.table(rows)
    }).then(() => viewalldepartments()).catch(err => {
        console.log(err)
    })
}
appStart()