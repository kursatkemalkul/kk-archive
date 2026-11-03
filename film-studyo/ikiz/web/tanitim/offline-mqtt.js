// This viewer deliberately has no broker connection or publishing capability.
export class Mqtt {constructor(){this.bagli=false;this.sayac=0;}abone(){}dinle(){}durum(fn){fn(false);}baglan(){}yayinla(){return false;}}
export const metin=bytes=>new TextDecoder().decode(bytes);
