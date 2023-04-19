const Category = require("../models/categoryModel");
const Products = require("../models/productModel");

const categoryCtrl = {

    // Get all categories
    getCategories: async (req,res)=>{
        try {
            const categories = await Category.find();
            res.json(categories);

        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    
    createCategory: async (req,res)=>{
        try {
            // only admin can create category

            const {name} = req.body;
            const category = await Category.findOne({name});
            if(category)
            {
                return res.status(400).json({msg: "Category already exists"});
            }

            const newCategory = new Category({name});
            await newCategory.save();

            res.json({msg: "Category created successfully"});

            
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    deleteCategory: async (req,res)=>{
        try {
            const products = await Products.find({category: req.params.id});
            if(products) return res.status(400).json({msg: "Category is not empty"});
            
            await Category.findByIdAndDelete(req.params.id);
            res.json({msg: "Category deleted successfully"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    updateCategory: async (req,res)=>{
        try {
            const {name} = req.body;
            await Category.findOneAndUpdate({_id: req.params.id},{name});

            res.json({msg: "Category updated successfully"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    }

};




module.exports = categoryCtrl;