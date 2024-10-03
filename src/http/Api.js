import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljtjkdhtecpvzbdlzjbi.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const PORT = 8000

export const MESSAGE_PATH = "/message"

export  function launchApi() {
    // Setup HTTP api
    const api = express()
    api.use(express.json())
    api.use(cors())
    api.use(bodyParser.json());
   
      
    // Listen to server start on port
    api.listen(PORT, () => console.log(`express is up on port ${PORT}`))

    return api  
} 



// Endpoint to create a new user


