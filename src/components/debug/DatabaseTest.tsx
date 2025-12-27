import { useState } from "react";
import { Button } from "../ui/button";
import { supabase } from "../../utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function DatabaseTest() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setResults(prev => [...prev, message]);
  };

  const testConnection = async () => {
    setResults([]);
    setLoading(true);
    addLog("🔍 Testing database connection...");

    try {
      // Test 1: Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`);
      } else if (session) {
        addLog(`✅ User logged in: ${session.user.email}`);
        addLog(`   User ID: ${session.user.id}`);
      } else {
        addLog(`⚠️ No user logged in`);
      }

      // Test 2: Check if profiles table exists and is accessible
      addLog("\n📊 Testing profiles table...");
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (profilesError) {
        addLog(`❌ Profiles table error: ${profilesError.message}`);
        addLog(`   Code: ${profilesError.code}`);
        addLog(`   Details: ${JSON.stringify(profilesError.details)}`);
      } else {
        addLog(`✅ Profiles table accessible`);
        addLog(`   Found ${profiles?.length || 0} profiles`);
      }

      // Test 3: Check user_stats table
      addLog("\n📊 Testing user_stats table...");
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .limit(1);

      if (statsError) {
        addLog(`❌ User stats table error: ${statsError.message}`);
      } else {
        addLog(`✅ User stats table accessible`);
        addLog(`   Found ${stats?.length || 0} stats records`);
      }

      // Test 4: If user is logged in, check their profile
      if (session?.user) {
        addLog("\n👤 Checking current user's profile...");
        const { data: userProfiles, error: userProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);

        if (userProfileError) {
          addLog(`❌ Error fetching user profile: ${userProfileError.message}`);
        } else if (userProfiles && userProfiles.length > 0) {
          addLog(`✅ User profile exists`);
          addLog(`   Data: ${JSON.stringify(userProfiles[0], null, 2)}`);
        } else {
          addLog(`❌ No profile found for user ${session.user.id}`);
          addLog(`   This means the trigger didn't fire or RLS is blocking it`);
        }

        // Test 5: Try to insert/update profile manually
        addLog("\n✏️ Testing manual profile update...");
        const { data: updateResult, error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email || '',
            full_name: 'Test User',
            college: 'Test College',
          }, {
            onConflict: 'id'
          })
          .select();

        if (updateError) {
          addLog(`❌ Manual update failed: ${updateError.message}`);
          addLog(`   Code: ${updateError.code}`);
          addLog(`   Details: ${JSON.stringify(updateError.details)}`);
        } else {
          addLog(`✅ Manual update succeeded`);
          addLog(`   Result: ${JSON.stringify(updateResult, null, 2)}`);
        }
      }

      addLog("\n✅ Database test complete!");
    } catch (error: any) {
      addLog(`❌ Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Testing..." : "Run Database Test"}
        </Button>

        {results.length > 0 && (
          <div className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
            {results.map((result, i) => (
              <div key={i} className="whitespace-pre-wrap">{result}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
