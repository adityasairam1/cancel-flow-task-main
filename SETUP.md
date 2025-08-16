# Setup Guide for A/B Testing

## Environment Variables Setup

To use the A/B testing functionality with a real Supabase database, you need to create a `.env.local` file in the root directory with the following variables:

```bash
# Create .env.local file in the root directory
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

## Local Development Setup

1. **Start Supabase locally:**
   ```bash
   npm run db:setup
   ```

2. **Create .env.local file** with the variables above

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Fallback Behavior

If you don't set up the environment variables or database:
- The app will use default localhost URLs and demo keys
- A/B testing will work with mock data
- You'll see warning messages in the console
- The functionality will still work for testing purposes

## Testing A/B Variants

- **Variant A**: No downsell screen (goes directly to cancellation flow)
- **Variant B**: Shows $10 off offer ($25→$15, $29→$19)

The variant assignment is deterministic - the same user will always get the same variant.

