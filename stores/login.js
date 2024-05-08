import {ref, reactive} from 'vue'
import { defineStore } from 'pinia'

export const useLoginStore = defineStore('login', () => {
    const loginForm = reactive({
        username: '',
		password: '',
		isRemeber: false
    })
	
	function saveAccount(account) {
		console.log(account);
		loginForm.username = account.username
		loginForm.password = account.password
		loginForm.isRemeber = true
	}
	
	function clearAccount() {
		loginForm.username = ''
		loginForm.password = ''
		loginForm.isRemeber = false
	}


    return { loginForm, saveAccount, clearAccount }
})
