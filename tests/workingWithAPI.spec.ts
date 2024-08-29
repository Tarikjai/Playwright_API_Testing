import { test, expect , request} from '@playwright/test';
import tag from '../test-data/tags.json';
 

test.beforeEach(async ({page})=>{
   
  await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => {
     
    await route.fulfill({
      
      body: JSON.stringify(tag)
    })
  })
  await page.goto("https://conduit.bondaracademy.com/")
  await page.waitForTimeout(500)
  
  await page.goto('https://conduit.bondaracademy.com/');
  await page.getByText('Sign in').click();
  await page.getByRole('textbox', { name: 'Email' }).fill('napty89@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  await page.getByRole('button').click();

 
  
})
  
test('has title', async ({ page }) => {
  await page.route("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0", async route => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description = "This is a MOCK test description"

    await route.fulfill({
      body:JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toContainText("This is a MOCK test title")
  await expect(page.locator('app-article-list p').first()).toContainText("This is a MOCK test description")

});

test("Create API and Delete Manually", async ({page, request })=>{
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
  data:  {
   "user":{"email": "napty89@gmail.com", "password": "123456"} 
    }
  })

  const responseBody = await response.json()
  const accessToken = await responseBody.user.token
  

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/',{
    headers: {
      Authorization: `Token ${accessToken}`  // Ajout du token dans les en-têtes
    },
    data :{
      "article": {"title": "my article", "description": "my description", "body": "my my all", "tagList": "[]"}}
  })

  const responseBodyPost = await articleResponse.json()
  const articleSlug = await  responseBodyPost.article.slug
  console.log(articleSlug)

  expect(articleResponse.status()).toEqual(201);

  // DELETE with API
  /*
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
    headers: {
      Authorization: `Token ${accessToken}`  // Ajout du token dans les en-têtes
    }
  });
  console.log(deleteArticleResponse)
  // Vérifier si la suppression a réussi
  expect(deleteArticleResponse.status()).toBe(204);  // Vérifie que la suppression a un statut 200 (OK)

 */

  // DELETE manually
  await page.getByText('Global Feed').click()
  await page.getByText('my article').click()
  await page.getByRole('button',{name:'Delete Article'}).first().click(); 

})

