# School ID Format - User-Friendly System

## New ID Format: `SCH-ABC-TIMESTAMP-CODE`

### Examples:
- `SCH-THS-456789-ABC` (Test High School)
- `SCH-CPS-123456-XYZ` (City Primary School)  
- `SCH-LMS-789012-DEF` (Lincoln Middle School)
- `SCH-CHS-345678-GHI` (Central High School)

## Format Breakdown:
- **SCH**: Standard prefix for all schools
- **ABC**: First 3 letters of school name (uppercase)
- **TIMESTAMP**: Last 6 digits of current timestamp
- **CODE**: Random 3-character alphanumeric code

## Benefits:
✅ **Readable**: Users can identify school by name abbreviation
✅ **Unique**: Timestamp + random ensures no duplicates
✅ **Searchable**: Easy to filter by SCH prefix
✅ **Professional**: Consistent format across all schools
✅ **Traceable**: Timestamp helps with debugging/auditing

## Previous vs New Format:

### Before (Random):
- `cmlajgrkk002wqwf0amdywalb`
- `school_456xyz123`

### After (User-Friendly):
- `SCH-THS-456789-ABC`
- `SCH-CPS-123456-XYZ`

## Implementation:
The ID is generated when creating a new school and includes:
1. School name abbreviation (first 3 letters)
2. Current timestamp (last 6 digits)
3. Random alphanumeric code (3 characters)

This makes IDs both meaningful and technically robust!
