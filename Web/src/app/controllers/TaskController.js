const task = require('../models/task');
const employee = require('../models/employee');
const mcp = require('../models/mcp');

function convertStrToTime(str) {
    var hour = str.slice(0, 2);
    var min = str.slice(3, 5);
    var mer = str.slice(6, 8);
    hour = parseInt(hour);
    min = parseInt(min);
    if (mer === 'pm') {
        hour = hour + 12;
    }
    return hour*60 + min;
};

class TaskController {
    
    // [GET] /
    index(req, res, next) {
        const filter = {};
        if (Object.keys(req.query).length === 0) {
            
        } else {
            const { date, state, id_employee} = req.query;
            if (!date && !state && !id_employee) {
                return res.render('task', {
                    taskActive: true
                });
            } else {
                if (date) filter.date = date;
                if (state) filter.state = state;
            }
        }
        task.find(filter)
            .then(tasks => {
                tasks = tasks.map(tasks => tasks.toObject());
                tasks.forEach(task => {
                    if (task.state === 0) {
                        task.notYet = true;
                    } else if (task.state === 1) {
                        task.inProgress = true;
                    } else if (task.state === 2) {
                        task.done = true;
                    }
                    var month = (task.date.getMonth() + 1).toString();
                    var day = task.date.getDate().toString();
                    if (task.date.getMonth() < 10) {
                        month = "0" + month;
                    }
                    if (task.date.getDate() < 10) {
                        day = "0" + day;
                    }
                    task.date_str = `${day}/${month}/${task.date.getFullYear()}`;
                })
                res.render('task', {
                    tasks: tasks,
                    taskActive: true
                });
            })
            .catch(next);
    }
    // [POST] / :id
    create(req, res, next) {
        var time_start = req.body['time-start'];
        var time_end = req.body['time-end'];
        var date = req.body['date-assign'];
        if (!time_start || !time_end || !date) {
            return res.redirect('back');
        }
        
        if (convertStrToTime(time_end) - convertStrToTime(time_start) < 0) {
            return res.redirect('back');
        } else {
            task.create({
                date: new Date(date),
                time_start: time_start,
                time_end: time_end,
                state: 0
            })
                .then(() => res.redirect('back'))
                .catch(next)
        }
    }

    // [DELETE] / :id
    destroy(req, res, next) {
        var taskId = req.params.id;
        task.findById(taskId)
            .then(async (taskObj) => {
                if (taskObj.leader) {
                    var promise1 = await employee.findByIdAndUpdate(taskObj.leader, {
                        assign_MCP: false
                    })
                    if (Array.isArray(taskObj.assignment)) {
                        var promise2 = taskObj.assignment.map(async (employeeId) => {
                            var employeeObj = await employee.findById(employeeId);
                            employeeObj.assign_MCP = false;
                            await employeeObj.save();
                        })
                    } 
                    else {
                        var promise2 = await employee.findByIdAndUpdate(taskObj.assignment, {
                            assign_MCP: false
                        })
                    }
                    Promise.all([promise1, promise2])
                        .then(() => {
                            task.deleteOne({ _id: taskId})
                                .then(() => res.redirect('back'))
                                .catch(next);
                        })
                        .catch(next);
                }
                else {
                    task.deleteOne({ _id: taskId})
                        .then(() => res.redirect('back'))
                        .catch(next);
                }
            })
            .catch(next);
    }

    // [PATCH] / :id
    update(req, res, next) {
        var time_start = req.body['time-start'];
        var time_end = req.body['time-end'];
        var date = req.body['date-assign'];
        if (!time_start || !time_end || !date) {
            return res.redirect('back');
        }
        if (convertStrToTime(time_end) - convertStrToTime(time_start) < 0) {
            return res.redirect('back');
        } else {
            task.findByIdAndUpdate(req.params.id,
                {
                    date: new Date(date),
                    time_start: time_start,
                    time_end: time_end,
                }
            )
                .then(() => res.redirect('back'))
                .catch(next)
        }
    }

    // [GET] / :id / assign (page)
    assign(req, res, next) {
        task.findById(req.params.id)
            .then(taskObj => {
                var promise1 = mcp.find()
                    .then(mcps => mcps.map(mcp => mcp.toObject()))
                    .catch(next);
                var promise2 = employee.find({
                    position: "janitor",
                    assign_MCP: false
                })
                    .then(employees => employees.map(employee => employee.toObject()))
                    .catch(next);
                if (!taskObj.mcp) {
                    Promise.all([promise1, promise2])
                        .then((data) => {
                            res.render('taskAssign', {
                                taskActive: true,
                                task_id: req.params.id,
                                assigned: false,
                                
                                mcps: data[0],
                                employees: data[1],
                            })
                        })
                        .catch(next);
                } 
                else {
                    var promise3 = mcp.findById(taskObj.mcp)
                        .then(mcpObj => mcpObj.toObject())
                        .catch(next);
                    var promise4 = employee.findById(taskObj.leader)
                        .then(employeeLead => employeeLead.toObject())
                        .catch(next);
                    var promise5 = taskObj.assignment.map(async employeeId => {
                        var employeeObj = await employee.findById(employeeId);
                        return employeeObj.toObject();
                    });
                    Promise.all([promise1, promise2, promise3, promise4, ...promise5])
                        .then(data => {
                            res.render('taskAssign', {   
                                taskActive: true,
                                task_id: req.params.id,
                                assigned: true,
                                
                                mcps: data[0],
                                employees: data[1],
                                address: data[2].address,
                                leader: data[3].name,
                                employees_assigned: data.slice(4),
                            })               
                        })
                        .catch(next);
                }
                
            })
            .catch(next);
    }

    // [POST] / :id / assign
    async assignment(req, res, next) {
        var mcp = req.body.mcp;
        var leader = req.body.leader;
        var employees = req.body['employee-assigned'];
        var taskId = req.params.id;
        if (!mcp || !leader || !employee) {
            
        } else {
            var taskObj = await task.findById(taskId);
            taskObj.leader = leader;
            if (taskObj.assignment) {
                if (Array.isArray(employees)) {
                    taskObj.assignment.push(...employees);
                } else {
                    taskObj.assignment.push(employees);
                }
            }
            taskObj.mcp = mcp;
            await taskObj.save();

            var leaderObj = await employee.findById(leader);
            leaderObj.assign_MCP = true;
            await leaderObj.save();

            if (Array.isArray(employees)) {
                employees.forEach(async employeeId => {
                    var employeeObj = await employee.findById(employeeId);
                    employeeObj.assign_MCP = true;
                    await employeeObj.save();
                })
            } else {
                var employeeObj = await employee.findById(employees);
                employeeObj.assign_MCP = true;
                await employeeObj.save();
            }
        }
        return res.redirect('/task/' + taskId + '/assign');
    }

    // [DELETE] /:id /assign
    deleteAssign(req, res, next) {
        var taskId = req.params.id;
        task.findById(taskId)
            .then(async (taskObj) => {
                var promise1 = await employee.findByIdAndUpdate(taskObj.leader, {
                    assign_MCP: false
                })
                if (Array.isArray(taskObj.assignment)) {
                    var promise2 = await taskObj.assignment.map(async (employeeId) => {
                        var employeeObj = await employee.findByIdAndUpdate(employeeId);
                        employeeObj.assign_MCP = false;
                        await employeeObj.save();
                    })
                } else {
                    var promise2 = await employee.findByIdAndUpdate(taskObj.assignment, {
                        assign_MCP: false
                    })
                }
                taskObj.leader = undefined;
                taskObj.mcp = undefined;
                taskObj.assignment = [];
                taskObj.assignment.length = 0;
                var promise3 = await taskObj.save();

                Promise.all([promise1, promise2, promise3])
                    .then(() => {
                        return res.redirect('/task/' + taskId + '/assign');
                    })
            })
            .catch(next);
    }
}

module.exports = new TaskController;