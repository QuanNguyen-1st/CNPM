const employee = require('../models/employee');
const vehicle = require('../models/vehicle');
const mcp = require('../models/mcp');

class VehicleController {
    // [GET] /
    index(req, res, next) {
        vehicle.find({
            assigned: true
        })
            .then(async vehicles => {
                vehicles = vehicles.map(vehicle => vehicle.toObject());
                var promises = vehicles.map(async vehicle => {
                    var employeeObj = await employee.findById(vehicle.assign_empolyee)
                    vehicle.employee_name = employeeObj.name;
                    if (vehicle.state === 0) {
                        vehicle.notYet = true;
                    } else if (vehicle.state === 1) {
                        vehicle.collecting = true;
                    } else if (vehicle.state === 2) {
                        vehicle.moving = true;
                    } else if (vehicle.state === 3) {
                        vehicle.done = true;
                    }
                    return vehicle;
                })
                Promise.all(promises)
                    .then(vehicles => {
                        return res.render('vehicle', {
                            vehicles: vehicles,
                            vehicleActive: true
                        });
                    })
                    .catch(next);
            })
            .catch(next);
        
    }

    // [GET] / assign /
    assign(req, res, next) {
        vehicle.find({
            type: 'collecting',
            assigned: false
        })
            .then((vehicles) => {
                vehicles = vehicles.map(vehicle => vehicle.toObject());
                employee.find({
                    position: 'collector',
                    assign_vehicle: false
                })
                    .then((employees) => {
                        employees = employees.map((employee) => employee.toObject());
                        res.render('vehicleAssign', {
                            vehicleActive: true,
                            employees: employees,
                            vehicles: vehicles
                        });
                    })
                    .catch(next);
            })
            .catch(next);
    }

    // [PATCH] / assign / :vehicle_id/ :employee_id
    assignment(req, res, next) {
        vehicle.findByIdAndUpdate(req.params.vehicle_id,{
            state: 0,
            assigned: true,
            assign_empolyee: req.params.employee_id
        })
            .then(() => {
                employee.findByIdAndUpdate(req.params.employee_id, {
                    assign_vehicle: true
                })
                    .then(() => res.redirect('/vehicle'))
                    .catch(next);
            })
            .catch(next);
    }

    // [PATCH] / :id
    async unassignment(req, res, next) {
        const vehicleObj = await vehicle.findById(req.params.id);
        const employeeId = vehicleObj.assign_empolyee;
        
        vehicleObj.assign_empolyee = undefined;
        vehicleObj.state = 0;
        vehicleObj.assigned = false;
        vehicleObj.mcp_list = [];
        vehicleObj.mcp_list.length = 0;
        
        await vehicleObj.save();

        await employee.findByIdAndUpdate(employeeId, {
            assign_vehicle: false
        })

        return res.redirect('/vehicle');
    }

    assignMCP(req, res, next) {
        const vehicle_id = req.params.id;
        const promise1 = vehicle.findById(vehicle_id)
            .then(vehicleObj => vehicleObj.toObject())
            .catch(next);
        const promise2 = mcp.find()
            .then(mcpList => mcpList.map(mcpObj => mcpObj.toObject()))
            .catch(next);
        Promise.all([promise1, promise2])
            .then(data => {
                var prmoise3 = employee.findById(data[0].assign_empolyee)
                    .then(employeeObj => employeeObj.toObject())
                    .catch(next);
                var promise4 = data[0].mcp_list.map(async mcpId => {
                    var mcpObj = await mcp.findById(mcpId);
                    if (mcpObj) return mcpObj.toObject();
                    else return;
                })

                const state = {
                    notYet: false,
                    collecting: false,
                    moving: false,
                    done: false
                }
                if (data[0].state === 0) {
                    state.notYet = true;
                } else if (data[0].state === 1) {
                    state.collecting = true;
                } else if (data[0].state === 2) {
                    state.moving = true;
                } else if (data[0].state === 3) {
                    state.done = true;
                }

                var renderOpt = {
                    vehicleActive: true,

                    vehicle_id: data[0]._id,
                    plate: data[0].plate,
                    mcps: data[1],
                    state: state,
                }
                Promise.all([prmoise3, ...promise4])
                    .then((data) => {
                        renderOpt.assign_empolyee = data[0].name;
                        renderOpt.mcp_list = data.slice(1);
                        res.render('vehicleAssMCP', renderOpt);
                    })
                    .catch(next);
            })
            .catch(next);
    }

    async assignmentMCP(req, res, next) {
        const vehicle_id = req.params.id;
        const mcp_id = req.body.mcp;
        var vehicleObj = await vehicle.findById(vehicle_id);
        if (vehicleObj.mcp_list.includes(mcp_id)) {
            
        } else {
            vehicleObj.mcp_list.push(mcp_id);
            await vehicleObj.save();
        }
        res.redirect('/vehicle/' + vehicle_id + '/assign');
    }

    async unassignmentMCP(req, res, next) {
        const vehicle_id = req.params.vehicle_id;
        const mcp_id = req.params.mcp_id;
        var vehicleObj = await vehicle.findById(vehicle_id);
        vehicleObj.mcp_list.remove(mcp_id);
        await vehicleObj.save();
        res.redirect('/vehicle/' + vehicle_id + '/assign');
    }
}

module.exports = new VehicleController;