app.delete('/profile/:index', async(req, res) => {
    try {
      await db.image.destroy({
        where: {
          id: req.params.index
        }
      })
      res.redirect('/profile');
    } catch(e) {
      console.log(e.message)
    }
  })