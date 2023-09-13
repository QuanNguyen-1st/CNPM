const mcp = require('../models/mcp');

class MCPController {
    // [GET] /
    index(req, res) {
        mcp.find()
            .then(mcps => {
                mcps = mcps.map(mcp => mcp.toObject());
                res.render('mcp', {
                    mcpActive: true,
                    mcps: mcps
                });
            })
    }
    
    destroy(req, res, next) {
        mcp.deleteOne({_id: req.params.id})
            .then(() => res.redirect('/mcp'))
            .catch(next);
    }

    create(req, res, next) {
        var mcp_address = req.body.mcp_address;
        if (!mcp_address) {
            return res.redirect('/mcp');
        } else {
            mcp.create({
                address: mcp_address,
                fill_percentage: 0,
            })
                .then(() => res.redirect('/mcp'))
                .catch(next);
        }
    }
}

module.exports = new MCPController;