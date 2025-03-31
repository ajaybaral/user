import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "../utils/usertype";

const userSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String },
    profileImage: { type: String },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;