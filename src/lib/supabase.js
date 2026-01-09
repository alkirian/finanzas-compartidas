import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gurersihncmweqeexdup.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cmVyc2lobmNtd2VxZWV4ZHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzMxMDUsImV4cCI6MjA4MzU0OTEwNX0.FxyVTsmPi1KphAtpbv8vptu_AQYgu0uExN1seAABZzA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
