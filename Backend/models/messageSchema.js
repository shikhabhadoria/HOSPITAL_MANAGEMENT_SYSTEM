import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "FirstName must contain atleast 3 characters!"]
    },

    lastName: {
        type: String,
        required: true,
        minLength: [3, "LastName must contain atleast 3 characters!"]
    },

    email: {
        type:String,
        required: true,
        validator: [validator.isEmpty, "please provide a valid email!"]
    },

    phone: {
        type:String,
        required: true,
        minLength: [10, "phone number must contain 10 digit!"],
        maxLength: [10, "phone number must contain 10 digit!"]
    },

    message: {
        type:String,
        required: true,
        minLength: [11, "message must contain atleast 11 characters!"]
    }
});

export const Message = mongoose.model("Message", messageSchema);

