# File Operations & Database Transactions: Design Decision Document

## Problem Statement

When updating records that involve both database changes and file system operations (like image uploads/deletions), we need to ensure consistency between the database and the file system, despite the lack of a true distributed transaction spanning both systems.

## Current Implementation Analysis

Our CMS handles image updates in the `update_class` function using this workflow:

```javascript
await run_in_transaction(db, async () => {
    // 1. Check if class exists, if not delete new image
    // 2. Update database with new image reference
    // 3. Log the update action
    // 4. Delete old image if there's a new one (within transaction)
});
```

## Risk Analysis of Different Approaches

### Approach 1: Delete Old Image Inside Transaction (Current Implementation)

```javascript
await run_in_transaction(db, async () => {
    // Database updates
    // ...
    await save_action("class updated", "update");
    
    // Delete old image
    if (new_image && oldClass.image) {
        await delete_image(oldClass.image, "classes");
    }
});
```

**Risks:**
- **Critical Vulnerability**: Server crash or power failure between image deletion and transaction commit
- **Impact**: Users see broken images (old image gone, DB still references it)
- **Recovery Cost**: Requires manual DB update to fix references
- **Likelihood**: Extremely rare, but catastrophic for affected records

### Approach 2: Delete Old Image After Transaction

```javascript
let oldImageToDelete = null;

await run_in_transaction(db, async () => {
    // Database updates
    // ...
    await save_action("class updated", "update");
    
    // Just mark image for deletion
    if (new_image && oldClass.image) {
        oldImageToDelete = oldClass.image;
    }
});

// Delete after successful transaction
if (oldImageToDelete) {
    await delete_image(oldImageToDelete, "classes");
}
```

**Risks:**
- **Vulnerability**: Server crash after commit but before image deletion
- **Impact**: Orphaned files on disk (waste storage space)
- **Recovery Cost**: Periodic cleanup job can handle automatically
- **Likelihood**: Rare, but slightly more common than Approach 1

## Comparison Matrix

| Factor | Approach 1 (Inside) | Approach 2 (After) |
|--------|--------------------|--------------------|
| User Experience | Poor if failure occurs | Good (always shows some image) |
| Data Integrity | Risk of dangling references | Database always consistent |
| Disk Usage | Better (no orphaned files) | May leave orphaned files |
| Error Recovery | Manual intervention | Automated cleanup possible |
| Implementation Complexity | Simple | Simple |

## Recommendation

After careful analysis of our specific CMS requirements and use case, we've decided to **implement Approach 1** (delete old image inside transaction). This decision is based on:

1. The extremely small risk window between deletion and commit (microseconds)
2. The local nature of our CMS with minimal concurrent users
3. The simplicity and clarity of keeping all operations within a single transaction
4. Avoiding additional complexity for an edge case that's highly unlikely in our environment

For a high-scale production system with thousands of concurrent users, we might revisit this decision and consider Approach 2.

## Mitigation Strategies

1. **Implement a cleanup job** that runs periodically to:
   - Find all image files on disk
   - Compare against references in database
   - Remove any files not referenced in the database

2. **Consider a temporary state** for safer implementation:
   ```javascript
   // Update to mark old image as "pending deletion"
   await db.run(`UPDATE classes SET image = ?, old_image = ? WHERE id = ?`, 
     [newImage, oldImage, id]);
   
   // Then delete old_image files in a cleanup job
   ```

## Lessons for Production Systems

1. **Two-phase commits** are often used in distributed systems to handle operations that span multiple resources.

2. **Idempotent operations** are preferable - operations that can be safely retried without side effects.

3. **Eventually consistent** approaches work well for file systems where immediate consistency isn't critical.

4. **Health metrics** should track orphaned files to identify system issues.

5. **Recovery procedures** should be documented and tested.

This pattern applies to many real-world scenarios beyond just image updates, including email sending, payment processing, and other external service interactions.

## Implementation Example

Here's our current implementation using Approach 1 (deleting within the transaction):

```javascript
async function update_class(id, updated_Class = {}, new_image = null) {
  // Use a transaction to ensure data integrity
  await run_in_transaction(db, async () => {
    // Fetch the existing class 
    const oldClass = await db.get("SELECT * FROM classes WHERE id = ?", [id]);

    // If class not found delete new image and throw error 
    if (!oldClass) {
      if (new_image) await delete_image(new_image, "classes");
      throw new App_error(`Class with ID ${id} not found`, 404, "CLASS_NOT_FOUND");
    }

    // Build the query dynamically
    if (new_image) updated_Class.image = new_image;
    const { query, values } = build_update_query(updated_Class, id);

    // Execute the query
    const result = await db.run(query, values);

    // If nothing changed delete the image and throw err 
    if (result.changes === 0) {
      if (new_image) await delete_image(new_image, "classes");
      throw new App_error(`Update failed for class with ID ${id}`, 500, "UPDATE_FAILED");
    }
    
    // Log the action
    await save_action("class updated", "update");

    // Delete old image if there's a new one (at the end of the transaction)
    if (new_image && oldClass.image) await delete_image(oldClass.image, "classes");
  });
}
```

## Future Improvements

For a more robust solution in a high-scale production environment, consider:

1. Implement Approach 2 (moving file deletion outside transaction) for higher reliability
2. Add a dedicated file management service that handles file operations asynchronously
3. Create a database table to track pending file operations
4. Set up a scheduled job to process pending operations and handle retries
5. Add monitoring and alerts for orphaned files or failed operations
6. Implement a cleanup job to handle any inconsistencies between files and database

## Risk Management for Current Implementation

To mitigate the small risk of our current implementation:

1. **Move file deletion to end of transaction**: We already place file deletion as the last operation within the transaction, minimizing the window for failures.
2. **Local environment**: Our CMS runs in a local environment with minimal concurrent users, reducing risk.
3. **Consistent backups**: Regular database backups ensure we can recover from data issues.
4. **Document recovery procedure**: In the rare case of failure, administrators can manually update the database records.
