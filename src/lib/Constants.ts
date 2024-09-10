import { join } from "path";
import { OrderItemType } from "../typings/Order";

export const rootDir = join(__dirname, "..", "..");
export const srcDir = join(rootDir, "src");

export const fullItemName: Record<OrderItemType, string> =
  {
    cpn: "Cà phê nâu",
    cpd: "Cà phê đen",
    cps: "Cà phê sữa",
    cpt: "Cà phê trứng",
    cpm: "Cà phê muối",
    cpa: "Americano",
    trh: "Hồng Trà",
    trmo: "Trà Mật Ong",
    trhn: "Trà Hoa Nhài",
    trd: "Trà Đá",
    trl: "Lipton",
    trml: "Matcha Latte",
    soc: "Soda Chanh",
    sovq: "Soda Việt Quất",
  };