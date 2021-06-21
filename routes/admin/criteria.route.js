const {criteriaController, criteriaOptionController} = require("../../controller/");
const {getValidationResult} = require("../../middleware/validate.middleware");

module.exports = (app) => {

    //criteria
    app.get("/admin/criteria",
        criteriaController.getAllCriterions
    )

    app.get("/admin/criteria/types",
        criteriaController.getCriteriaTypes
    )

    app.get("/admin/criteria/:id/",
        criteriaController.validate('getCriteria'),
        getValidationResult,
        criteriaController.getCriteria
    )
    app.post("/admin/criteria/:id/deleteDB",
        criteriaController.validate('deleteCriteriaDB'),
        getValidationResult,
        criteriaController.deleteCriteriaDB
    )
    //edit
    app.post("/admin/criteria/:ccode/edit",
        criteriaController.validate('editCriteria'),
        getValidationResult,
        criteriaController.editCriteria
    )
    //set isDeleted - true
    app.post("/admin/criteria/:ccode/delete",
        criteriaController.validate('deleteCriteria'),
        getValidationResult,
        criteriaController.deleteCriteria
    )
    //set isDeleted - false
    app.post("/admin/criteria/:ccode/restore",
        criteriaController.validate('restoreCriteria'),
        getValidationResult,
        criteriaController.restoreCriteria
    )

    //get deleted criterions of a standard
    app.get("/admin/criteria/deleted",
        criteriaController.getAllDeletedCriterions
    )

    ////criteria option
    //get criteria's all options
    app.get("/admin/criteria/:ccode/option",
        criteriaOptionController.validate('getCriteriaOptions'),
        getValidationResult,
        criteriaOptionController.getCriteriaOptions
    )
    
    //create new option
    app.post("/admin/criteria/:ccode/addCriteriaOption",
        criteriaOptionController.validate('addCriteriaOption'),
        getValidationResult,
        criteriaOptionController.addCriteriaOption
    )

    //get single option info using code
    app.get("/admin/criteria/option/:ocode/get",
        criteriaOptionController.validate('getCriteriaOption'),
        getValidationResult,
        criteriaOptionController.getCriteriaOption
    )
    //edit option
    app.post("/admin/criteria/option/:ocode/edit",
        criteriaOptionController.validate('editCriteriaOption'),
        getValidationResult,
        criteriaOptionController.editCriteriaOption
    )
    //set isDeleted - true
    app.post("/admin/criteria/option/:ocode/delete",
        criteriaOptionController.validate('deleteCriteriaOption'),
        getValidationResult,
        criteriaOptionController.deleteCriteriaOption
    )
    //set isDeleted - false
    app.post("/admin/criteria/option/:ocode/restore",
        criteriaOptionController.validate('restoreCriteriaOption'),
        getValidationResult,
        criteriaOptionController.restoreCriteriaOption
    )
    //get deleted options 
    app.get("/admin/criteria/:ccode/option/deleted",
        criteriaOptionController.validate('getCriteriaOptions'),
        getValidationResult,
        criteriaOptionController.getDeletedCriteriaOptions
    )
}