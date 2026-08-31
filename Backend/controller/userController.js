import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtTokens.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import { v2 as cloudinary } from "cloudinary";

export const patientRegister = catchAsyncErrors(async(req, res, next)=>{
    const { firstName,
            lastName,
            email,
            phone,
            password,
            gender,
            dob,
            nic,
            role
            } = req.body;
    
    if(
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password ||
            !gender ||
            !dob ||
            !nic ||
            !role
    ){
        return next(new ErrorHandler("Please Fill FUll FOrm!", 400));
    }

    let user = await User.findOne({email});
    if(user){
        return next(new ErrorHandler("User Already Registered!", 400));
    }
    user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role
    });

    generateToken(user, "User Registered!", 200, res);

});

export const login = catchAsyncErrors(async(req, res, next) => {
    const {email, password, role} = req.body;
    if(!email || !password|| !role){
        return next(new ErrorHandler("Please provide All the details!", 400));
    }
   
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid password or Email", 400));
    }
    const isPasswordMatched = await user.comparedPassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid password!", 400));
    }

    if(role !== user.role){
        return next(new ErrorHandler("user with this role is not found!", 400));
    }
    generateToken(user, "User Logged in successfully!", 200, res);
    res.status(200).json({
        success:true,
        message: "user Logged in successfully!"
    })
})

export const addNewAdmin = catchAsyncErrors(async(req, res, next) => {
    const {
        firstName, 
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic
    } = req.body;

    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic){
        return next(new ErrorHandler("Please fill full form!", 400));
    }

    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler("Admin with this Email Already Exist!"));
    }
  
    await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role:"Admin",
    })

    res.status(200).json({
        success:true,
        message:"New Admin Registered!"
    });

});

export const getAllDocters = catchAsyncErrors(async(req, res, next)=>{
    const doctors = await User.find({ role: "Doctor" });
    res.status(200).json({
        success:true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async(req, res, next)=>{
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const logoutAdmin = catchAsyncErrors(async(req, res, next)=>{
    res.status(200).cookie("adminToken", "", {
        ...cookieOptions,
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "user Log Out Successfully!",
    });
}) 

export const logoutPatient = catchAsyncErrors(async(req, res, next) => {
    res.status(200).cookie("patientToken", "", {
        ...cookieOptions,
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "user log out successfully"
    })
});

export const addNewDocter = catchAsyncErrors(async(req, res, next) => {
    try{

    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Docter Avatar Required!", 400));
    }

    const { docAvatar } = req.files;
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    const fileExtension = docAvatar.name
        .split(".")
        .pop()
        .toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        return next(new ErrorHandler("File Format Not Supported!", 400));
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        doctorDepartment,

    } = req.body;


    
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !doctorDepartment){
        return next(new ErrorHandler("Please Provide Full Details!", 400));
    }

    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email!`, 400));
    }


    const cloudinaryResponse = await cloudinary.uploader.upload(
        docAvatar.tempFilePath
    );

    console.log(cloudinaryResponse);

    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error(
            "cloudinary Error",
            cloudinaryResponse?.error || "Unknown cloudinary Error"
        );
    }

   
    const docter = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        doctorDepartment,
        role:"Doctor",
        docAvatar:{
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    // console.log("2");
    res.status(200).json({
        success: true,
        message: "New Docter Registered!",
        docter
    });
    

}catch(error){
    console.log("enter into catch")
    res.status(400).json({
        message:error.message
    })
}
});

