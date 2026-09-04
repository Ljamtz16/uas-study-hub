"use client";
import { useEffect } from "react";
import { useProgressStore } from "./store";
export function useProgress(){const state=useProgressStore();useEffect(()=>{void useProgressStore.getState().load();},[]);return state;}
