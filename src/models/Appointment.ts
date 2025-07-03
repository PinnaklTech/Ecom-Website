import mongoose, { Schema, Document } from 'mongoose';

interface ICartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IAppointment extends Document {
  userId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  cartItems: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const AppointmentSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  cartItems: [CartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
AppointmentSchema.index({ userId: 1, appointmentDate: -1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentDate: 1 });

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);