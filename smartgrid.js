module.exports = {
    columns: 12,
    offset: '24px',
    container: {
        maxWidth: '1280px',
        fields: '24px' // >= offset/2
    },
    breakPoints: {
        lg: {
            width: '1000px',
        },
        md: {
            width: '920px',
            fields: '15px'
        },
        sm: {
            width: '540px'
        },
        xs: {
            width: '480px'
        },
        xxs: {
			      width: '375px',
        },
        xxxs: {
          width: '320px',
      }
	},
	detailedCalc: true
};
