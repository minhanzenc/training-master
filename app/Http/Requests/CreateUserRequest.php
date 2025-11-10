<?php

namespace App\Http\Requests;

use App\Enums\GroupRoleEnum;
use App\Enums\StatusUserEnum;
use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
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
        return [
            'name'  => 'required|string|max:255|min:5',
            'email' => 'required|email|unique:mst_users,email',
            'password'=> 'required|string|min:5|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'password_confirmation' => 'required|string|min:5',
            'group_role'=> 'required|string|in:' . implode(',', GroupRoleEnum::getLabels()),
            'is_active'=> 'required|in:'.implode(',', StatusUserEnum::getLabels()),
        ];
    }
}
