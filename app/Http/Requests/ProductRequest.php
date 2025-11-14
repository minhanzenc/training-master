<?php

namespace App\Http\Requests;

use App\Enums\ProductStatusSaleEnum;
use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'product_name' => 'required|string|max:255',
            'product_price' => 'required|numeric|min:0',
            'product_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'is_sales' => 'required|integer|in:'.implode(',', ProductStatusSaleEnum::getLabels()),
            'description' => 'nullable|string',
        ];

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'product_name.required' => 'Tên sản phẩm không được để trống',
            'product_name.max' => 'Tên sản phẩm không được vượt quá 255 ký tự',
            'product_price.required' => 'Giá sản phẩm không được để trống',
            'product_price.numeric' => 'Giá sản phẩm phải là số',
            'product_price.min' => 'Giá sản phẩm phải lớn hơn hoặc bằng 0',
            'is_sales.required' => 'Trạng thái không được để trống',
            'is_sales.in' => 'Trạng thái không hợp lệ',
            'product_image.image' => 'File phải là hình ảnh',
            'product_image.mimes' => 'Hình ảnh phải có định dạng jpeg, png, jpg hoặc gif',
            'product_image.max' => 'Kích thước hình ảnh không được vượt quá 5MB',
        ];
    }
}
