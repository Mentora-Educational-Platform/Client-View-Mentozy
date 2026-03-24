const url = "https://zcujgxjbxprfuscjfnxe.supabase.co/functions/v1/invite-teacher";

async function testOptions() {
  const res = await fetch(url, {
    method: "OPTIONS",
    headers: {
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "authorization, x-client-info, apikey, content-type",
      "Origin": "http://localhost:3000"
    }
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  console.log("Response:", text);
}

testOptions();
