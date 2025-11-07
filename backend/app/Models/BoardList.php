<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardList extends Model
{
    use HasFactory;

    protected $table = 'lists';

    protected $fillable = [
        'title',
        'position',
        'board_id',
    ];

    protected $casts = [
        'position' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function cards()
    {
        return $this->hasMany(Card::class, 'list_id')->orderBy('position');
    }
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }
}
