const employee = require('../models/employee');

class EmployeeController {
    index(req, res, next) {
        employee.find()
            .then(employeesOb => {
                const employees = employeesOb.map(employee => {
                    var collector = false;
                    if (employee.position === 'collector') {
                        collector = true;
                    }
                    return {
                        _id: employee._id,
                        name: employee.name,
                        collector: collector
                    }
                })
                res.render('employee', {
                    employeeActive: true,
                    employees: employees
                });
            })
            .catch(next);
    }

    makeChanges(req, res, next) {
        var promises = Object.entries(req.body).map(async index => {
            var employeeObj = await employee.findById(index[0])
            if (employeeObj.assign_MCP || employeeObj.assign_vehicle) {

            } else {
                employeeObj.position = `${index[1]}`;
            }
            await employeeObj.save();
        })
        Promise.all(promises)
            .then(() => res.redirect('employee'))
            .catch(next);
    }
}

module.exports = new EmployeeController;