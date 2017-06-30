import mongoose, {Schema} from 'mongoose';
export const neoSchema = new Schema({
  date: {
    type: Date,
  },
  name: {
    type: String
  },
  speed: {
    type: String
  },
  reference: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  isHazardous: {
    type: Boolean
  },
}, {
  versionKey: false,
});
mongoose.model('Neo', neoSchema);

export default mongoose.model('Neo');