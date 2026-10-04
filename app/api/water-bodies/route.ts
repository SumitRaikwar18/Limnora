import { NextResponse } from 'next/server'
import { supabaseRest } from '@/lib/supabase-rest'
export async function GET(){try{
 const r=await supabaseRest('water_bodies?select=id,name,type,latitude,longitude,place_label&order=created_at.desc&limit=200')
 if(!r.ok)throw Error()
 return NextResponse.json({waterBodies:await r.json()})
 }catch{return NextResponse.json({error:'Water-body list unavailable'},{status:503})}}
