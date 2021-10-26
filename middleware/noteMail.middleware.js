module.exports = {
    addNote: function(req, res, next) {
        if(!req.body.token){
            res.status(400).json({
                message: 'Thiếu token'
            })
            return
        }
        if(!req.body.name){
            res.status(400).json({
                message: 'Thiếu name'
            })
            return
        }
        next()
    },
    getNote: function(req, res, next) {
        if(!req.body.token){
            res.status(400).json({
                message: 'Thiếu token'
            })
            return
        }
        next()
    },
    editNote: function(req, res, next) {
        if(!req.body.token){
            res.status(400).json({
                message: 'Thiếu token'
            })
            return
        }
        if(!req.body.name){
            res.status(400).json({
                message: 'Thiếu name'
            })
            return
        }
        if(!req.body.id_Note){
            res.status(400).json({
                message: 'Thiếu id_Note'
            })
            return
        }
        next()
    },
    deleteNote: function(req, res, next) {
        if(!req.body.token){
            res.status(400).json({
                message: 'Thiếu token'
            })
            return
        }
        if(!req.body.id_Note){
            res.status(400).json({
                message: 'Thiếu id_Note'
            })
            return
        }
        next()
    },
}