const router = require('express').Router();
const cloudinary = require('cloudinary');
const fs = require('fs');

const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

// upload image on cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.CLOUD_API_SECRET
});

// upload image
router.post('/upload',auth,authAdmin,(req,res)=>{
    try {
        
        console.log(req.files);

        if(!req.files || Object.keys(req.files).length ===0)
        {
            return res.status(400).json({msg:"No files were uploaded"});
        }
        const file = req.files.file;
        if(file.size > 1024*1024) // more than 1mb
        {
            removeTmpFiles(file.tempFilePath);
            return res.status(400).json({msg:"File size is too big"});
        }
        if(file.mimetype !== 'image/jpeg' && file.mimetype!=='image/png')
        {
            removeTmpFiles(file.tempFilePath);
            return res.status(400).json({msg:"File type is not supported"});
        }
        cloudinary.v2.uploader.upload(file.tempFilePath,{
            folder:'test'
        }, async (err,result)=>{
            if(err) throw err;
            removeTmpFiles(file.tempFilePath);
            res.json({public_id: result.public_id, url: result.secure_url})
        })

        // res.json({msg:'Files are uploaded scuccessfully'});

        
    } catch (err) {
        return res.status(500).json({msg: err.message});
    }
})

//delete image
router.post('/destroy',auth,authAdmin,(req,res)=>{
    try {
        const {public_id} = req.body;
        if(!public_id)
        {
            return res.status(400).json({msg:"No image was deleted"});
        }
        cloudinary.v2.uploader.destroy(public_id,(err,result)=>{
            if(err) throw err;
            res.json({msg:"Image deleted successfully"});
        });
    } catch (err) {
        return res.status(500).json({msg: err.message});
    }

})

const removeTmpFiles = (path)=>{
    fs.unlink(path,err=>{
        if(err) throw err;

    })
}

module.exports = router;