package org.antigravity.agenticessence.core.synthesis

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Delete
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import androidx.room.Update
import kotlinx.coroutines.flow.Flow
import kotlinx.serialization.Serializable

@Entity(tableName = "synthesized_tools")
@Serializable
data class SynthesizedToolEntity(
    @PrimaryKey
    val name: String,
    val description: String,
    val parameterSchemaJson: String,
    val executionType: String, // "JAVASCRIPT" or "SHELL"
    val scriptContent: String,
    val isValidated: Boolean = true,
    val invocationCount: Int = 0,
    val successCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)

@Dao
interface ToolRegistryDao {
    @Query("SELECT * FROM synthesized_tools ORDER BY createdAt DESC")
    fun getAllTools(): Flow<List<SynthesizedToolEntity>>

    @Query("SELECT * FROM synthesized_tools ORDER BY createdAt DESC")
    suspend fun getAllToolsOnce(): List<SynthesizedToolEntity>

    @Query("SELECT * FROM synthesized_tools WHERE name = :name LIMIT 1")
    suspend fun getToolByName(name: String): SynthesizedToolEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTool(tool: SynthesizedToolEntity)

    @Update
    suspend fun updateTool(tool: SynthesizedToolEntity)

    @Delete
    suspend fun deleteTool(tool: SynthesizedToolEntity)

    @Query("DELETE FROM synthesized_tools WHERE name = :name")
    suspend fun deleteToolByName(name: String)

    @Query("UPDATE synthesized_tools SET invocationCount = invocationCount + 1, successCount = successCount + :isSuccess WHERE name = :name")
    suspend fun recordInvocation(name: String, isSuccess: Int)
}

@Database(entities = [SynthesizedToolEntity::class], version = 1, exportSchema = false)
abstract class ToolDatabase : RoomDatabase() {
    abstract fun toolRegistryDao(): ToolRegistryDao
}
