export interface ICreateManufacture {
  ice_id: string;
  amount: object;
  date_time: Date;
  user_id: number;
  product_id: number[];
}

export interface IUpdateManufacture {
  ice_id: string;
  manufacture_id: number;
  amount: number;
  date_time: Date;
  user_id: number;
  product_id: number;
}
