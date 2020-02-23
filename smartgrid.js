module.exports = {
    columns: 12,
    offset: '24px',
    container: {
        maxWidth: '960px',
        fields: '24px' // >= offset/2
    },
    breakPoints: {
        // lg: {
        //     width: '1000px',
        // },
        md: {
            width: '920px',
            fields: '15px' 
        },
        sm: {
            width: '620px'
        },
        xs: {
            width: '480px'
        },
        xxs: {
			width: '350px',
        }
	},
	detailedCalc: true 
};