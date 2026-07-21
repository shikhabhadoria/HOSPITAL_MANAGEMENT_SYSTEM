import mongoose from "mongoose"

export const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "MERN_STACK_HOSPITAL_MANAGEMENT_SYSTEM"
    }).then(() => {
        console.log("db connection successfull");
    }).catch(err=> {
        console.log(`some error occured while connecting the db ${err}`);
    })
}