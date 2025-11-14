<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_image' => $this->product_image ? asset($this->product_image) : null,
            'product_price' => number_format($this->product_price, 0, ',', '.'),
            'product_price_raw' => $this->product_price,
            'is_sales' => $this->is_sales,
            'is_sales_text' => $this->getSalesStatusText(),
            'description' => $this->description,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get sales status text
     *
     * @return string
     */
    private function getSalesStatusText(): string
    {
        return match ($this->is_sales) {
            0 => 'Dừng bán',
            1 => 'Đang bán',
            2 => 'Hết hàng',
            default => 'Không xác định',
        };
    }
}
