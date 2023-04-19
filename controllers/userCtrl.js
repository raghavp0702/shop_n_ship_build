const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const Payments = require('../models/paymentModel');

const userCtrl= {
    register: async (req,res)=>{

        try{
            const {name,email,password} = req.body;
            const user = await Users.findOne({email});

            if(user)
            {
                return res.status(400).json({msg: 'User already exists'});
            }
            if(password.length < 6)
            {
                return res.status(400).json({msg: 'Password should be at least 6 characters long'});
            }
            
            //passwrod encyrption

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);

            const newUser = new Users({
                name,email,password:hashedPassword
            })

            await newUser.save();

            // creating jsonwebtoken

            const accessToken = createAccessToken({id: newUser._id})
            
            const refreshToken = createRefreshToken({id: newUser._id})

            res.cookie('refreshToken', refreshToken,{
                httpOnly: true,
                path: '/user/refresh_token'
            })

            res.json({accessToken});
           
            res.json({msg: 'User created successfully'});
        
        }catch(err)
        {
            return res.status(500).json({msg: err.message});
        }


    },

    login: async (req,res)=>{
        try {
            const {email,password} = req.body;

            const user = await Users.findOne({email});

            if(!user)
            {
                return res.status(400).json({msg: 'User does not exist'});
            }
            const isSame = await bcrypt.compare(password,user.password);

            if(!isSame)
            {
                return res.status(400).json({msg: 'Incorrect password'});
            }
            

            // correct credentials the, create access token and refresh token
            const accessToken = createAccessToken({id: user._id})
            
            const refreshToken = createRefreshToken({id: user._id})

            res.cookie('refreshToken', refreshToken,{
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            })

            res.json({accessToken});
            
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },

    logout: async (req,res)=>{
        try {
            res.clearCookie('refreshToken',{path:'/user/refresh_token'});
            return res.json({msg: 'Logout successfully'});
            
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },

    refreshToken : (req,res)=>{

        try {
            const rf_token = req.cookies.refreshToken;
            if(!rf_token)
            {
                return res.json({msg: 'please login again'});
            }
            jsonwebtoken.verify(rf_token, process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
                if(err ) return res.json({msg: 'please login again'});
                const accesstoken = createAccessToken({id: user.id});

                res.json({accessToken: accesstoken});

            })
            res.json({rf_token});
            
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }

    },
    getUser: async(req,res)=>{
        try {
            const user = await Users.findById(req.user.id).select('-password');

            if(!user) return res.status(404).json({msg: 'User not found'});

            return res.json({user});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    addCart: async (req,res)=>{
    try {
        const user = await Users.findById(req.user.id);
        if(!user)
        {
            return res.status(404).json({msg: 'User not found'});
        }
        await Users.findOneAndUpdate({_id: req.user.id},{
            cart: req.body.cart
        })
        return res.json({msg: 'Added to Cart successfully'});
        
    } catch (err) {
        return res.status(500).json({msg: err.message});
    }
    
    
    },
    history: async(req,res)=>{
        try {
            const history = await Payments.find({user_id:req.user.id});
            res.json(history)
            
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    }
}

const createAccessToken = (user)=>{

    return jsonwebtoken.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '17m'});
}
const createRefreshToken = (user)=>{

    return jsonwebtoken.sign(user,process.env.REFRESH_TOKEN_SECRET,{expiresIn: '7d'});
}

module.exports = userCtrl;