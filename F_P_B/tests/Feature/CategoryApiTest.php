<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles if they don't exist
        \App\Models\Role::firstOrCreate(['name' => 'admin']);
        \App\Models\Role::firstOrCreate(['name' => 'customer']);

        // Create users
        $this->admin = User::factory()->create([
            'role' => 'admin'
        ]);

        $this->regularUser = User::factory()->create([
            'role' => 'customer'
        ]);
    }

    /** @test */
    public function it_can_list_categories()
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         '*' => ['id', 'name', 'parent_id']
                     ]
                 ]);
    }

    /** @test */
    public function it_can_show_a_category()
    {
        $category = Category::factory()->create();

        $response = $this->getJson("/api/categories/{$category->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'id' => $category->id,
                         'name' => $category->name
                     ]
                 ]);
    }

    /** @test */
    public function it_returns_404_for_nonexistent_category()
    {
        $response = $this->getJson('/api/categories/99999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_get_category_tree()
    {
        $parent = Category::factory()->create(['name' => 'Electronics']);
        Category::factory()->create(['name' => 'Phones', 'parent_id' => $parent->id]);
        Category::factory()->create(['name' => 'Laptops', 'parent_id' => $parent->id]);

        $response = $this->getJson('/api/categories-tree');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         '*' => [
                             'name' => 'Electronics',
                             'children' => [
                                 '*' => ['name']
                             ]
                         ]
                     ]
                 ]);
    }

    /** @test */
    public function admin_can_create_category()
    {
        $categoryData = [
            'name' => 'New Category',
            'parent_id' => null
        ];

        $response = $this->actingAs($this->admin)
                        ->postJson('/api/admin/categories', $categoryData);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Category created successfully'
                 ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'New Category'
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_create_category()
    {
        $categoryData = [
            'name' => 'New Category'
        ];

        $response = $this->postJson('/api/admin/categories', $categoryData);

        $response->assertStatus(401);
    }

    /** @test */
    public function non_admin_cannot_create_category()
    {
        $categoryData = [
            'name' => 'New Category'
        ];

        $response = $this->actingAs($this->regularUser)
                        ->postJson('/api/admin/categories', $categoryData);

        $response->assertStatus(403);
    }
}