import mongoose, { Document, Schema } from 'mongoose';

export interface IWaitlist extends Document {
  name: string;
  country: string;
  email: string;
  dateJoined: Date;
}

const waitlistSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      },
    dateJoined: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Waitlist = mongoose.model<IWaitlist>('Waitlist', waitlistSchema);

export default Waitlist;
