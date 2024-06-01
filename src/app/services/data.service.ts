import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  getDocs,
  query,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(public firestore: Firestore) {}

  async createRobot(name: string, color: string, age: string) {
    try{
    const docRef = await addDoc(collection(this.firestore, 'robots'), {
      name: name,
      color: color,
      age: age,
    });
    console.log('Document written with ID: ', docRef.id);

  }
  catch(err){
    console.log("asdasddfqw",err)
  }
  }

  async getRobots() {
    return (
     await getDocs(query(collection(this.firestore, 'robots')))
    ).docs.map((robots) => robots.data());
   }
}
