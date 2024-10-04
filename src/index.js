import {launchApp} from "./app/Application.js";
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js'
import { prisma } from './http/prisma.js';
// Launch our application
 launchApp()
